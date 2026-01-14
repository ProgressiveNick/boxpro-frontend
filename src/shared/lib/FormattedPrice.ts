export function formattedPrice(value:number | undefined): string{
    return value ? value.toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    .concat(' ₽') : 'По запросу'
}


