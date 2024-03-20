import { useContext } from "react"
import { AppContext } from "../context/AppContext"

const useApp = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp should be used within a AppProvider.");
    }

    return context

}

export default useApp