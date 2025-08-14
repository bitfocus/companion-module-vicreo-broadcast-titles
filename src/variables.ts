import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables = [
		// Status variables
		{ variableId: 'selected_row', name: 'Selected Row Number (1-based)' },
		{ variableId: 'live_row', name: 'Live Row Number (1-based)' },
		{ variableId: 'total_rows', name: 'Total Number of Rows' },
		{ variableId: 'is_output_live', name: 'Is Output Live (YES/NO)' },

		// Data variables
		{ variableId: 'has_data', name: 'Has Excel Data Loaded (YES/NO)' },
		{ variableId: 'filename', name: 'Excel Filename' },
		{ variableId: 'current_sheet', name: 'Current Sheet Name' },
		{ variableId: 'sheet_count', name: 'Number of Sheets' },

		// Selected row data (dynamic based on Excel columns)
		{ variableId: 'selected_title', name: 'Selected Row - Title' },

		// Live row data (dynamic based on Excel columns)
		{ variableId: 'live_title', name: 'Live Row - Title' },
	]

	// Add row title variables for presets (up to 50 rows)
	for (let i = 1; i <= 50; i++) {
		variables.push({
			variableId: `row_${i}_title`,
			name: `Row ${i} Title (First Column)`,
		})
	}

	self.setVariableDefinitions(variables)
}
