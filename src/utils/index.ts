interface RGBAObject {
    R: string
    G: string
    B: string
    A: string
}
export function rgba2object(rbga: string): RGBAObject | null {
    if (!/^rgba(\d{1,3},\d{1,3},\d{1,3})$/.test(rbga.trim().toLowerCase())) {
        return null
    } else {
        return null
    }
}