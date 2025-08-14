import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		// Navigation actions
		navigate_up: {
			name: 'Navigate Up',
			options: [],
			callback: async () => {
				self.sendCommand('up')
			},
		},
		navigate_down: {
			name: 'Navigate Down',
			options: [],
			callback: async () => {
				self.sendCommand('down')
			},
		},
		select_row: {
			name: 'Select Row',
			options: [
				{
					id: 'index',
					type: 'number',
					label: 'Row Index (0-based)',
					default: 0,
					min: 0,
					max: 999,
				},
			],
			callback: async (event) => {
				self.sendCommand('select', { index: Number(event.options.index) })
			},
		},
		select_row_1based: {
			name: 'Select Row (1-based)',
			options: [
				{
					id: 'row',
					type: 'number',
					label: 'Row Number (1-based)',
					default: 1,
					min: 1,
					max: 1000,
				},
			],
			callback: async (event) => {
				self.sendCommand('select', { index: Number(event.options.row) - 1 })
			},
		},

		// Output control actions
		go_live: {
			name: 'Go Live',
			options: [],
			callback: async () => {
				self.sendCommand('live')
			},
		},
		clear_output: {
			name: 'Clear Output',
			options: [],
			callback: async () => {
				self.sendCommand('clear')
			},
		},

		// Information actions
		refresh_data: {
			name: 'Refresh Data',
			options: [],
			callback: async () => {
				self.sendCommand('refresh')
			},
		},
		get_status: {
			name: 'Get Status',
			options: [],
			callback: async () => {
				self.sendCommand('status')
			},
		},
		get_data: {
			name: 'Get Data',
			options: [],
			callback: async () => {
				self.sendCommand('data')
			},
		},
		get_sheets: {
			name: 'Get Sheets',
			options: [],
			callback: async () => {
				self.sendCommand('sheets')
			},
		},

		// Combined actions
		select_and_live: {
			name: 'Select Row and Go Live',
			options: [
				{
					id: 'row',
					type: 'number',
					label: 'Row Number (1-based)',
					default: 1,
					min: 1,
					max: 1000,
				},
			],
			callback: async (event) => {
				// Select the row first, then go live
				self.sendCommand('select', { index: Number(event.options.row) - 1 })
				// Small delay to ensure selection is processed
				setTimeout(() => {
					self.sendCommand('live')
				}, 100)
			},
		},
		next_and_live: {
			name: 'Next Row and Go Live',
			options: [],
			callback: async () => {
				self.sendCommand('down')
				// Small delay to ensure navigation is processed
				setTimeout(() => {
					self.sendCommand('live')
				}, 100)
			},
		},
		previous_and_live: {
			name: 'Previous Row and Go Live',
			options: [],
			callback: async () => {
				self.sendCommand('up')
				// Small delay to ensure navigation is processed
				setTimeout(() => {
					self.sendCommand('live')
				}, 100)
			},
		},
		go_live_row: {
			name: 'Go Live with Specific Row',
			options: [
				{
					id: 'row',
					type: 'textinput',
					label: 'Row Number (1-based) - can use variables',
					default: '1',
					useVariables: true,
				},
			],
			callback: async (event) => {
				// Parse the row number (support variables)
				const rowText = await self.parseVariablesInString(String(event.options.row))
				const rowNumber = parseInt(rowText, 10)

				if (isNaN(rowNumber) || rowNumber < 1) {
					self.log('warn', `Invalid row number: ${rowText}`)
					return
				}

				// Convert to 0-based index for the select command
				const rowIndex = rowNumber - 1
				self.sendCommand('select', { index: rowIndex })

				// Small delay to ensure selection is processed, then go live
				setTimeout(() => {
					self.sendCommand('live')
				}, 100)
			},
		},
	})
}
