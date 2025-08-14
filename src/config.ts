import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	reconnectInterval: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Host',
			width: 8,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'WebSocket Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8080,
		},
		{
			type: 'number',
			id: 'reconnectInterval',
			label: 'Reconnect Interval (seconds)',
			width: 4,
			min: 1,
			max: 60,
			default: 5,
		},
	]
}
