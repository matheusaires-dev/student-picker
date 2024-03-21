/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, createContext, useState } from "react";
export const AttendanceListContext = createContext({});

const AttendanceListProvider = ({ children }: { children?: ReactNode }) => {

    const [number, setNumber] = useState(0);
    return (
        <AttendanceListContext.Provider value={{}}>
            {children}
        </AttendanceListContext.Provider>
    )
}

export default AttendanceListProvider