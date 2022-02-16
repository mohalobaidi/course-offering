import Section from "./Section"


interface Table {
    id: number,
    shareID?: string,
    sections: Section[]
}

export default interface State {
    tables: Table[],
    selectedTableID: number,
    offerings: Section[],
    colors: any[]
}
