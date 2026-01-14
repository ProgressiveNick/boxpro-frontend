

export default function convertDateFromStrapi(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }
    const dateObj: Date = new Date(date)
    const formattedDate: string = dateObj.toLocaleDateString('ru-RU', options)

    return formattedDate
}