import { useState } from "react";

const useThrowAsyncError = () => {
  const [, setState] = useState();

  return (error: unknown) => {
    setState(() => {throw error })
  }

}

export default useThrowAsyncError;