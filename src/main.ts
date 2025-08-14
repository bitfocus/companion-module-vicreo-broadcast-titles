import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GetPresetDefinitions } from './presets.js'
import WebSocket from 'ws'

interface VicreoStatus {
	selectedRowIndex: number
	liveRowIndex: number
	isOutputLive: boolean
	totalRows: number
	selectedRowData: any
	liveRowData: any
	groupedDataMode: boolean
}

interface VicreoData {
	hasData: boolean
	filename?: string
	sheets: string[]
	currentSheet: string
	data?: any[] // Direct data array from WebSocket
	totalRows?: number
	selectedRowIndex?: number
	liveRowIndex?: number
	isOutputLive?: boolean
	groupedDataMode?: boolean
	groupedData: {
		enabled: boolean
	}
	timestamp?: string
	// Legacy support
	currentSheetData?: {
		name: string
		headers: string[]
		data: any[]
		rowCount: number
	} | null
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	private ws: WebSocket | null = null
	private reconnectTimer: NodeJS.Timeout | null = null
	private status: VicreoStatus = {
		selectedRowIndex: -1,
		liveRowIndex: -1,
		isOutputLive: false,
		totalRows: 0,
		selectedRowData: null,
		liveRowData: null,
		groupedDataMode: false,
	}
	private data: VicreoData = {
		hasData: false,
		filename: '',
		sheets: [],
		currentSheet: '',
		currentSheetData: null,
		groupedData: { enabled: false },
		timestamp: '',
	}

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		this.initWebSocket()
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.closeWebSocket()
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.closeWebSocket()
		this.initWebSocket()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		this.setPresetDefinitions(GetPresetDefinitions(this))
	}

	private initWebSocket(): void {
		try {
			const wsUrl = `ws://${this.config.host}:${this.config.port}`
			this.log('info', `Connecting to ${wsUrl}`)

			this.ws = new WebSocket(wsUrl)

			this.ws.on('open', () => {
				this.log('info', 'WebSocket connected')
				this.updateStatus(InstanceStatus.Ok)

				// Request initial data and status
				this.sendCommand('status')
				this.sendCommand('data')
			})

			this.ws.on('message', (rawData) => {
				try {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					const message = JSON.parse(rawData.toString())
					this.handleMessage(message)
				} catch (error) {
					this.log(
						'error',
						`Failed to parse WebSocket message: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			})

			this.ws.on('close', () => {
				this.log('warn', 'WebSocket connection closed')
				this.updateStatus(InstanceStatus.Disconnected)
				this.scheduleReconnect()
			})

			this.ws.on('error', (error) => {
				this.log('error', `WebSocket error: ${error}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.scheduleReconnect()
			})
		} catch (error) {
			this.log('error', `Failed to create WebSocket connection: ${error}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			this.scheduleReconnect()
		}
	}

	private closeWebSocket(): void {
		if (this.ws) {
			this.ws.removeAllListeners()
			if (this.ws.readyState === WebSocket.OPEN) {
				this.ws.close()
			}
			this.ws = null
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}

		this.reconnectTimer = setTimeout(() => {
			this.log('info', 'Attempting to reconnect...')
			this.initWebSocket()
		}, this.config.reconnectInterval * 1000)
	}

	private handleMessage(message: any): void {
		this.log('debug', `Received message type: ${message.type}`)

		switch (message.type) {
			case 'welcome':
				this.log('info', `Connected to VICREO Broadcast Titles on port ${message.port}`)
				this.log('debug', `Welcome message data: ${JSON.stringify(message, null, 2)}`)
				break

			case 'status':
				this.log('debug', `Status update: ${JSON.stringify(message.data, null, 2)}`)
				// Update status selectively to preserve other status data
				if (message.data.selectedRowIndex !== undefined) {
					this.status.selectedRowIndex = message.data.selectedRowIndex
				}
				if (message.data.liveRowIndex !== undefined) {
					this.status.liveRowIndex = message.data.liveRowIndex
				}
				if (message.data.isOutputLive !== undefined) {
					this.status.isOutputLive = message.data.isOutputLive
				}
				if (message.data.totalRows !== undefined) {
					this.status.totalRows = message.data.totalRows
				}
				if (message.data.groupedDataMode !== undefined) {
					this.status.groupedDataMode = message.data.groupedDataMode
				}
				if (message.data.selectedRowData) {
					this.status.selectedRowData = message.data.selectedRowData
				}
				if (message.data.liveRowData) {
					this.status.liveRowData = message.data.liveRowData
				}

				this.log(
					'debug',
					`Updated status: selectedRow: ${this.status.selectedRowIndex}, liveRow: ${this.status.liveRowIndex}, isOutputLive: ${this.status.isOutputLive}`,
				)

				this.updateVariables()
				this.checkFeedbacks()
				break

			case 'data':
				this.log('debug', `Data update: ${JSON.stringify(message.data, null, 2)}`)
				this.data = message.data

				// Log the data structure for debugging
				if (this.data.data && Array.isArray(this.data.data)) {
					this.log('debug', `Direct data array has ${this.data.data.length} rows`)
					if (this.data.data.length > 0) {
						this.log('debug', `First row sample: ${JSON.stringify(this.data.data[0])}`)
					}
				}
				if (this.data.currentSheetData?.data && Array.isArray(this.data.currentSheetData.data)) {
					this.log('debug', `Legacy currentSheetData has ${this.data.currentSheetData.data.length} rows`)
					if (this.data.currentSheetData.data.length > 0) {
						this.log('debug', `First legacy row sample: ${JSON.stringify(this.data.currentSheetData.data[0])}`)
					}
				}

				// Extract status information from data message if present
				if (message.data.selectedRowIndex !== undefined) {
					this.status.selectedRowIndex = message.data.selectedRowIndex
				}
				if (message.data.liveRowIndex !== undefined) {
					this.status.liveRowIndex = message.data.liveRowIndex
				}
				if (message.data.isOutputLive !== undefined) {
					this.status.isOutputLive = message.data.isOutputLive
				}
				if (message.data.totalRows !== undefined) {
					this.status.totalRows = message.data.totalRows
				}
				if (message.data.groupedDataMode !== undefined) {
					this.status.groupedDataMode = message.data.groupedDataMode
				}

				this.log(
					'debug',
					`Updated status from data: selectedRow: ${this.status.selectedRowIndex}, liveRow: ${this.status.liveRowIndex}, isOutputLive: ${this.status.isOutputLive}`,
				)

				this.updateVariables()
				this.updatePresets() // Update presets when data changes
				this.checkFeedbacks() // Update feedbacks after data and presets change
				break

			case 'response':
				if (!message.success) {
					this.log('warn', `Command failed: ${message.error}`)
				} else {
					this.log('debug', `Command successful: ${message.command}`)
				}
				break

			case 'error':
				this.log('error', `Server error: ${message.message}`)
				break

			default:
				this.log('debug', `Unknown message type: ${message.type}`)
		}
	}

	public sendCommand(command: string, params?: Record<string, any>): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			this.log('warn', `Cannot send command ${command}: WebSocket not connected`)
			return
		}

		const message = {
			command,
			...(params && { params }),
		}

		try {
			this.ws.send(JSON.stringify(message))
			this.log('debug', `Sent command: ${command}`)
		} catch (error) {
			this.log('error', `Failed to send command ${command}: ${String(error)}`)
		}
	}

	public getStatus(): VicreoStatus {
		return this.status
	}

	public getData(): VicreoData {
		return this.data
	}

	private updateVariables(): void {
		this.log(
			'debug',
			`updateVariables called - data.filename: "${this.data.filename}", data.hasData: ${this.data.hasData}`,
		)
		this.log(
			'debug',
			`Current status: selectedRowIndex: ${this.status.selectedRowIndex}, liveRowIndex: ${this.status.liveRowIndex}`,
		)
		this.log(
			'debug',
			`Available data rows: ${this.data.data ? this.data.data.length : 'none'}, legacy data: ${this.data.currentSheetData?.data ? this.data.currentSheetData.data.length : 'none'}`,
		)

		const variables: { [key: string]: string | number } = {
			// Status variables
			selected_row: this.status.selectedRowIndex >= 0 ? this.status.selectedRowIndex + 1 : 0,
			live_row: this.status.liveRowIndex >= 0 ? this.status.liveRowIndex + 1 : 0,
			total_rows: this.status.totalRows,
			is_output_live: this.status.isOutputLive ? 'YES' : 'NO',

			// Data variables
			has_data: this.data.hasData ? 'YES' : 'NO',
			filename: this.data.filename || '',
			current_sheet: this.data.currentSheet || '',
			sheet_count: this.data.sheets.length,

			// Initialize title variables with empty values (will be populated below if data exists)
			selected_title: '',
			live_title: '',
		}

		// Selected row data - always derive from stored dataset and current selectedRowIndex
		if (this.status.selectedRowIndex >= 0) {
			const selectedRowNumber = this.status.selectedRowIndex + 1 // Convert to 1-based
			this.log('debug', `Finding selected row title for row ${selectedRowNumber}`)

			// Get data rows from our stored dataset
			let dataRows: any[] = []
			if (this.data.data && Array.isArray(this.data.data)) {
				dataRows = this.data.data
				this.log('debug', `Using direct data array with ${dataRows.length} rows`)
			} else if (this.data.currentSheetData?.data && Array.isArray(this.data.currentSheetData.data)) {
				dataRows = this.data.currentSheetData.data
				this.log('debug', `Using legacy currentSheetData with ${dataRows.length} rows`)
			}

			// Find the row data for the selected row
			const selectedRowData = dataRows.find((rowData) => rowData.row === selectedRowNumber)
			this.log(
				'debug',
				`Found row data for row ${selectedRowNumber}: ${selectedRowData ? JSON.stringify(selectedRowData) : 'NOT FOUND'}`,
			)

			if (selectedRowData) {
				let titleValue = ''
				if (selectedRowData.Name) {
					titleValue = String(selectedRowData.Name).trim()
					titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
				} else {
					// Fallback: use first non-row column if Name doesn't exist
					const keys = Object.keys(selectedRowData).filter((key) => key !== 'row')
					if (keys.length > 0) {
						const firstColumnKey = keys[0]
						titleValue = String(selectedRowData[firstColumnKey] || '').trim()
						titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
					}
				}
				variables['selected_title'] = titleValue || `Row ${selectedRowNumber}`

				// Also populate any other selected_* variables from the row data if needed
				for (const [key, value] of Object.entries(selectedRowData)) {
					if (key !== 'row') {
						const variableName = `selected_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
						variables[variableName] =
							typeof value === 'string' || typeof value === 'number'
								? String(value)
								: value != null
									? JSON.stringify(value)
									: ''
					}
				}
			} else {
				this.log('debug', `Could not find data for selected row ${selectedRowNumber}`)
				variables['selected_title'] = ''
			}
		} else {
			// No selected row, clear the title
			variables['selected_title'] = ''
		}

		// Live row data - always derive from stored dataset and current liveRowIndex
		if (this.status.liveRowIndex >= 0) {
			const liveRowNumber = this.status.liveRowIndex + 1 // Convert to 1-based
			this.log('debug', `Finding live row title for row ${liveRowNumber}`)

			// Get data rows from our stored dataset
			let dataRows: any[] = []
			if (this.data.data && Array.isArray(this.data.data)) {
				dataRows = this.data.data
				this.log('debug', `Using direct data array with ${dataRows.length} rows for live row`)
			} else if (this.data.currentSheetData?.data && Array.isArray(this.data.currentSheetData.data)) {
				dataRows = this.data.currentSheetData.data
				this.log('debug', `Using legacy currentSheetData with ${dataRows.length} rows for live row`)
			}

			// Find the row data for the live row
			const liveRowData = dataRows.find((rowData) => rowData.row === liveRowNumber)
			this.log(
				'debug',
				`Found live row data for row ${liveRowNumber}: ${liveRowData ? JSON.stringify(liveRowData) : 'NOT FOUND'}`,
			)

			if (liveRowData) {
				let titleValue = ''
				if (liveRowData.Name) {
					titleValue = String(liveRowData.Name).trim()
					titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
				} else {
					// Fallback: use first non-row column if Name doesn't exist
					const keys = Object.keys(liveRowData).filter((key) => key !== 'row')
					if (keys.length > 0) {
						const firstColumnKey = keys[0]
						titleValue = String(liveRowData[firstColumnKey] || '').trim()
						titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
					}
				}
				variables['live_title'] = titleValue || `Row ${liveRowNumber}`

				// Also populate any other live_* variables from the row data if needed
				for (const [key, value] of Object.entries(liveRowData)) {
					if (key !== 'row') {
						const variableName = `live_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
						variables[variableName] =
							typeof value === 'string' || typeof value === 'number'
								? String(value)
								: value != null
									? JSON.stringify(value)
									: ''
					}
				}
			} else {
				this.log('debug', `Could not find data for live row ${liveRowNumber}`)
				variables['live_title'] = ''
			}
		} else {
			// No live row, clear the title
			variables['live_title'] = ''
		}

		// Sheet headers
		if (this.data.currentSheetData?.headers) {
			variables['headers'] = this.data.currentSheetData.headers.join(', ')
		}

		// Add row variables for each data row (for presets)
		// Handle both new direct data format and legacy currentSheetData format
		let dataRows: any[] = []
		if (this.data.data && Array.isArray(this.data.data)) {
			dataRows = this.data.data
		} else if (this.data.currentSheetData?.data && Array.isArray(this.data.currentSheetData.data)) {
			dataRows = this.data.currentSheetData.data
		}

		if (dataRows.length > 0) {
			this.log('debug', `Processing ${dataRows.length} rows for row title variables`)

			dataRows.forEach((rowData) => {
				const rowNumber = rowData.row || 1 // Use the row field from the data
				let titleValue = ''

				// Extract the Name field specifically for the title
				if (rowData.Name) {
					titleValue = String(rowData.Name).trim()
					// Clean up multi-line content and limit length
					titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
				} else {
					// Fallback: use first non-row column if Name doesn't exist
					const keys = Object.keys(rowData).filter((key) => key !== 'row')
					if (keys.length > 0) {
						const firstColumnKey = keys[0]
						titleValue = String(rowData[firstColumnKey] || '').trim()
						titleValue = titleValue.replace(/[\r\n\t]/g, ' ').substring(0, 50)
					}
				}

				const variableName = `row_${rowNumber}_title`
				variables[variableName] = titleValue || `Row ${rowNumber}`
			})
		}

		this.setVariableValues(variables)
	}

	public checkFeedbacks(): void {
		this.log(
			'debug',
			`Checking feedbacks - isOutputLive: ${this.status.isOutputLive}, selectedRow: ${this.status.selectedRowIndex}, liveRow: ${this.status.liveRowIndex}`,
		)
		// Check all feedbacks - this will trigger all feedback callbacks
		super.checkFeedbacks()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
