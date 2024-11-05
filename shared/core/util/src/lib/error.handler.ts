import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class CoreErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    // Handle the error, e.g., log it to a server, display a user-friendly message
    console.error('An error occurred:', error); // Replace with your desired error handling logic
  }
}
