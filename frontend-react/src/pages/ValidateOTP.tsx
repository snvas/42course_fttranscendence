import { FormEvent, MutableRefObject, useRef, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";

const ValidateOTP = () => {
  const registerForm: MutableRefObject<HTMLFormElement | null> =
    useRef<HTMLFormElement | null>(null);
  const { user, validateOTP } = useAuth() as AuthContextData;
  const [wrongOtp, setWrongOtp] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();
  const throwAsyncError = useThrowAsyncError();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!registerForm.current) {
      return;
    }
    try {
      const isOtpValid: boolean = await validateOTP(
        registerForm.current.code?.value
      );

      if (!isOtpValid) {
        setWrongOtp(true);
        return;
      }

      navigate("/");
    } catch (error) {
      throwAsyncError(error);
    }
  };

  return !user?.otpEnabled ? (
    <div className="container">
      <div className="two-factor-register-title">
        <h1>Two Factor Authentication is disabled</h1>
      </div>
    </div>
  ) : (
    <div className="container">
      <div className="two-factor-register-title">
        <h1> Validate One Time Password</h1>
      </div>

      <div className="two-factor-register-container">
        <form ref={registerForm} onSubmit={handleSubmit}>
          <div className="form-field-wrapper">
            <input type="code" name="code" placeholder="Enter the code" />
          </div>
          <div className="form-field-wrapper">
            <input type="submit" value="Validate" className="btn" />
          </div>
        </form>
      </div>

      {wrongOtp && <p className="warning-text">Invalid code, try again.</p>}
    </div>
  );
};

export default ValidateOTP;
