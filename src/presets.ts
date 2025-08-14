import { combineRgb } from '@companion-module/base'
import type { CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function GetPresetDefinitions(self: ModuleInstance): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {
		// Navigation presets
		navigate_up: {
			type: 'button',
			category: 'Navigation',
			name: 'Up',
			style: {
				text: '⬆️\\nUP',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'navigate_up',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		navigate_down: {
			type: 'button',
			category: 'Navigation',
			name: 'Down',
			style: {
				text: '⬇️\\nDOWN',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'navigate_down',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},

		// Output control presets
		go_live: {
			type: 'button',
			category: 'Output',
			name: 'Go Live',
			style: {
				text: '🔴\\nLIVE',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(200, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'go_live',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'is_live',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		},
		clear_output: {
			type: 'button',
			category: 'Output',
			name: 'Clear',
			style: {
				text: '⚫\\nCLEAR',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(50, 50, 50),
			},
			steps: [
				{
					down: [
						{
							actionId: 'clear_output',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},

		// Combined action presets
		next_and_live: {
			type: 'button',
			category: 'Quick Actions',
			name: 'Next & Live',
			style: {
				text: '⬇️🔴\\nNEXT\\nLIVE',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(150, 0, 150),
			},
			steps: [
				{
					down: [
						{
							actionId: 'next_and_live',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'is_live',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		},
		previous_and_live: {
			type: 'button',
			category: 'Quick Actions',
			name: 'Previous & Live',
			style: {
				text: '⬆️🔴\\nPREV\\nLIVE',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(150, 0, 150),
			},
			steps: [
				{
					down: [
						{
							actionId: 'previous_and_live',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'is_live',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		},

		// Status display presets
		status_display: {
			type: 'button',
			category: 'Status',
			name: 'Row Status',
			style: {
				text: 'Row $(vicreo-titles:selected_row) / $(vicreo-titles:total_rows)',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 100),
			},
			steps: [
				{
					down: [
						{
							actionId: 'get_status',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'has_data',
					options: {},
					style: {
						bgcolor: combineRgb(0, 0, 255),
					},
				},
			],
		},

		// Information action presets
		refresh_data: {
			type: 'button',
			category: 'Data',
			name: 'Refresh data',
			style: {
				text: '🔄\\nREFRESH',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(100, 100, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'refresh_data',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},

		// Selected row control preset
		selected_row_live: {
			type: 'button',
			category: 'Navigation',
			name: 'Go Live with Selected Row',
			style: {
				text: '🔴\\n$(vicreo-titles:selected_title)',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(50, 50, 150),
			},
			steps: [
				{
					down: [
						{
							actionId: 'go_live',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selected_row_is_live',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		},

		// Live row display preset
		live_row_display: {
			type: 'button',
			category: 'Live Row',
			name: 'Live Row Display',
			style: {
				text: 'LIVE: #$(vicreo-titles:live_row)\\n$(vicreo-titles:live_title)',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(150, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'is_live',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		},
	}

	// Generate dynamic row presets based on loaded data
	const data = self.getData()
	let dataRows: any[] = []

	// Handle both new direct data format and legacy currentSheetData format
	if (data.data && Array.isArray(data.data)) {
		dataRows = data.data
	} else if (data.currentSheetData?.data && Array.isArray(data.currentSheetData.data)) {
		dataRows = data.currentSheetData.data
	}

	if (data.hasData && dataRows.length > 0) {
		const maxRows = Math.min(dataRows.length, 20) // Limit to 20 rows to avoid too many presets

		for (let i = 0; i < maxRows; i++) {
			const rowData = dataRows[i]
			const rowNumber = rowData.row || i + 1

			presets[`row_${rowNumber}`] = {
				type: 'button',
				category: 'Row Selection',
				name: `Row ${rowNumber}`,
				style: {
					text: `$(vicreo-titles:row_${rowNumber}_title)`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 100, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'select_and_live',
								options: {
									row: rowNumber,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'row_selected',
						options: {
							row: rowNumber,
						},
						style: {
							bgcolor: combineRgb(0, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
					{
						feedbackId: 'row_is_live',
						options: {
							row: rowNumber,
						},
						style: {
							bgcolor: combineRgb(255, 0, 0),
							color: combineRgb(255, 255, 255),
						},
					},
				],
			}
		}
	} else {
		// Fallback: create static presets for rows 1-5 when no data is loaded
		for (let i = 1; i <= 5; i++) {
			presets[`row_${i}`] = {
				type: 'button',
				category: 'Row Selection',
				name: `Row ${i}`,
				style: {
					text: `${i}\\n$(vicreo-titles:row_${i}_title)`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 100, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'select_and_live',
								options: {
									row: i,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'row_selected',
						options: {
							row: i,
						},
						style: {
							bgcolor: combineRgb(0, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
					{
						feedbackId: 'row_is_live',
						options: {
							row: i,
						},
						style: {
							bgcolor: combineRgb(255, 0, 0),
							color: combineRgb(255, 255, 255),
						},
					},
				],
			}
		}
	}

	return presets
}
