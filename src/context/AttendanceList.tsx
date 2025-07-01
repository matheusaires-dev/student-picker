/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, createContext } from "react";
export const AttendanceListContext = createContext({});

const AttendanceListProvider = ({ children }: { children?: ReactNode }) => {

    return (
        <AttendanceListContext.Provider value={{}}>
            {children}
        </AttendanceListContext.Provider>
    )
}

export default AttendanceListProvider