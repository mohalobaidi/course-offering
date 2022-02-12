import Section from "./Section"

export default interface State {
    sections: Section[],
    offerings: Section[],
    colors: Map<string, string>
}  
