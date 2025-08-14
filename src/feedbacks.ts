import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		is_live: {
			name: 'Output is Live',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const status = self.getStatus()
				const result = status.isOutputLive
				self.log('debug', `is_live feedback callback: ${result} (isOutputLive: ${status.isOutputLive})`)
				return result
			},
		},
		row_selected: {
			name: 'Specific Row is Selected',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				const status = self.getStatus()
				const targetRow = Number(feedback.options.row) - 1 // Convert to 0-based
				const result = status.selectedRowIndex === targetRow
				self.log(
					'debug',
					`row_selected feedback callback: ${result} (selectedRow: ${status.selectedRowIndex}, targetRow: ${targetRow}, userRow: ${feedback.options.row})`,
				)
				return result
			},
		},
		row_is_live: {
			name: 'Specific Row is Live',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 100, 0),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => {
				const status = self.getStatus()
				const targetRow = Number(feedback.options.row) - 1 // Convert to 0-based
				const result = status.liveRowIndex === targetRow && status.isOutputLive
				self.log(
					'debug',
					`row_is_live feedback: ${result} (liveRow: ${status.liveRowIndex}, targetRow: ${targetRow}, isOutputLive: ${status.isOutputLive})`,
				)
				return result
			},
		},
		selected_row_is_live: {
			name: 'Selected Row is Live',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const status = self.getStatus()
				// Check if the currently selected row is also the live row
				const result =
					status.selectedRowIndex === status.liveRowIndex && status.isOutputLive && status.selectedRowIndex >= 0
				self.log(
					'debug',
					`selected_row_is_live feedback: ${result} (selectedRow: ${status.selectedRowIndex}, liveRow: ${status.liveRowIndex}, isOutputLive: ${status.isOutputLive})`,
				)
				return result
			},
		},
		has_data: {
			name: 'Excel Data is Loaded',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const data = self.getData()
				return data.hasData
			},
		},
		selected_row_contains: {
			name: 'Selected Row Contains Text',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(100, 0, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'column',
					type: 'textinput',
					label: 'Column Name',
					default: 'Title',
				},
				{
					id: 'text',
					type: 'textinput',
					label: 'Text to Search For',
					default: '',
				},
				{
					id: 'case_sensitive',
					type: 'checkbox',
					label: 'Case Sensitive',
					default: false,
				},
			],
			callback: (feedback) => {
				const status = self.getStatus()
				if (!status.selectedRowData) return false

				const columnData = status.selectedRowData[String(feedback.options.column)]
				if (!columnData) return false

				const searchText = String(feedback.options.text)
				const dataText = String(columnData)

				if (feedback.options.case_sensitive) {
					return dataText.includes(searchText)
				} else {
					return dataText.toLowerCase().includes(searchText.toLowerCase())
				}
			},
		},
		live_row_contains: {
			name: 'Live Row Contains Text',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 150, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'column',
					type: 'textinput',
					label: 'Column Name',
					default: 'Title',
				},
				{
					id: 'text',
					type: 'textinput',
					label: 'Text to Search For',
					default: '',
				},
				{
					id: 'case_sensitive',
					type: 'checkbox',
					label: 'Case Sensitive',
					default: false,
				},
			],
			callback: (feedback) => {
				const status = self.getStatus()
				if (!status.liveRowData || !status.isOutputLive) return false

				const columnData = status.liveRowData[String(feedback.options.column)]
				if (!columnData) return false

				const searchText = String(feedback.options.text)
				const dataText = String(columnData)

				if (feedback.options.case_sensitive) {
					return dataText.includes(searchText)
				} else {
					return dataText.toLowerCase().includes(searchText.toLowerCase())
				}
			},
		},
	})
}
