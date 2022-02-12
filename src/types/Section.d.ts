import Course from './Course'

export default interface Section {
    course: Course
    number: number
    type: SectionType
    crn: string
    days: string
    location: {
        building: string
        room: string
    }
    time: {
        start: string
        end: string
    }
    instructor: {
        name: string
    }
    seats: number
    waitlist: number
}

export enum  SectionType {"LEC", "LAB"}