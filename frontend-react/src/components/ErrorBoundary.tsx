import { Component, ErrorInfo, ReactNode } from 'react';
import Header from "./Header.tsx";
import { isAxiosError } from "axios";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCode: number | undefined;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCode: undefined,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (isAxiosError(error)) {
      this.setState({ hasError: true, error, errorCode: error.response?.status });
    } else {
      this.setState({ hasError: true, error });
    }

    console.error(error, errorInfo);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.state.hasError && !this.state.errorCode) {
      return (
        <>
          <Header></Header>
          <div className="container">
            <div className="error-page-wrapper">
              <h1>Something went wrong</h1>
              <p>We apologize for the inconvenience. Please try again later.</p>
              <br></br>
              <div>
                <a href={"/"}>Go to Home Page</a>
              </div>
            </div>
          </div>
        </>
      );
    }

    switch (this.state.errorCode) {
      case 401:
        return (
          <>
            <Header></Header>
            <div className="container">
              <div className="error-page-wrapper">
                <h1>401 - Unauthorized</h1>
                <p>You are not authorized to access this page.</p>
                <br></br>
                <div>
                  <a href={"/"}>Go to Home Page</a>
                </div>
              </div>
            </div>
          </>
        );
      case 403:
        return (
          <>
            <Header></Header>
            <div className="container">
              <div className="error-page-wrapper">
                <h1>403 - Forbidden</h1>
                <p>You are not authorized to access this page.</p>
                <br></br>
                <div>
                  <a href={"/"}>Go to Home Page</a>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <Header></Header>
            <div className="container">
              <div className="error-page-wrapper">
                <h1>Something went wrong</h1>
                <p>We apologize for the inconvenience. Please try again later.</p>
                <br></br>
                <div>
                  <a href={"/"}>Go to Home Page</a>
                </div>
              </div>
            </div>
          </>
        );
    }

  }
}

export default ErrorBoundary;