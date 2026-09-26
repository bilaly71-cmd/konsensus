// İstanbul saatiyle bugünün tarihi, YYYY-MM-DD formatında.
export function bugunIstanbul(): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}
