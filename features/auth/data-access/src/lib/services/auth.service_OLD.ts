// import { inject, Injectable } from '@angular/core';
// import { SharedCookieService } from '@ttrpg-ui/shared/cookie/data-access';
// import { AuthServiceConfig, AUTH_SERVICE_CONFIG_TOKEN  } from '@ttrpg-ui/features/auth/models';
// export interface AuthResponse {
//   access_token: string
//   expires_in: number
//   refresh_expires_in: number
//   refresh_token: string
//   token_type: string
//   id_token: string
//   "not-before-policy": number
//   session_state: string
//   scope: string
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private config: AuthServiceConfig = inject(AUTH_SERVICE_CONFIG_TOKEN);

//   private cookieService = inject(SharedCookieService);

//   public isAuthenticated(): boolean {
//     return this.cookieService.get<string>("AuthService.access_token") !== null;
//   };

//   public peridodicRefreshTokenCheck(seconds = 60): () => void {
//     const interval = setInterval(() => {
//       if (this.isAuthenticated()) this.checkRefreshToken();
//     }, seconds * 1000);
//     return () => clearInterval(interval);
//   };

//   private storeTokens(data: AuthResponse): void {
//     this.cookieService.set<string>(
//       "AuthService.access_token",
//       data.access_token,
//       { secure: true }
//     )
//     this.cookieService.set<number>(
//       "AuthService.expires_in",
//       Date.now() / 1000 + data.expires_in,
//       { secure: true }
//     )
//     this.cookieService.set<string>(
//       "AuthService.refresh_token",
//       data.refresh_token,
//       { secure: true }
//     )
//     this.cookieService.set<number>(
//       "AuthService.refresh_expires_in",
//       Date.now() / 1000 + data.refresh_expires_in,
//       { secure: true }
//     )
//   };

//   public logout(): void {
//     this.clearTokens();
//   }

//   private clearTokens(): void {
//     this.cookieService.delete("AuthService.access_token");
//     this.cookieService.delete("AuthService.expires_in");
//     this.cookieService.delete("AuthService.refresh_token");
//     this.cookieService.delete("AuthService.refresh_expires_in");
//   };

//   public async checkRefreshToken(): Promise<void> {
//     const refreshToken = this.cookieService.get<string>("AuthService.refresh_token");
//     const refreshExpires = this.cookieService.get<number>("AuthService.refresh_expires_in");
//     const now = Date.now() / 1000;
//     if (refreshToken && refreshExpires) {
//       if (now > refreshExpires - 180) {
//         this.clearTokens();
//         try {
//           const response = await fetch("/api/auth/refresh", {
//             method: "POST",
//             headers: { "content-type": "application/json" },
//             body: JSON.stringify({
//               token: refreshToken,
//             }),
//           });
//           if (response.status >= 400) {
//             const error = await response.json();
//             throw error.detail;
//           }
//           const data = await response.json();
//           this.storeTokens(data);
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     }
//   };

//   public async checkAccessToken() {
//     const accessToken = this.cookieService.get<string>("AuthService.access_token");
//     const refreshToken = this.cookieService.get<string>("AuthService.refresh_token");
//     const accessExpires = this.cookieService.get<string>("AuthService.expires_in");
//     const now = Date.now() / 1000;
//     if (accessToken && accessExpires) {
//       if (now > parseFloat(accessExpires) - 180) {
//         this.clearTokens();
//         try {
//           const response = await fetch("/api/auth/refresh", {
//             method: "POST",
//             headers: { "content-type": "application/json" },
//             body: JSON.stringify({
//               token: refreshToken,
//             }),
//           });
//           if (response.status >= 400) {
//             const error = await response.json();
//             throw error.detail;
//           }
//           const data = await response.json();
//           this.storeTokens(data);
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     }
//   };

//   public async getTokens(username: string, password: string) {
//     const formData = new FormData();
//     formData.append("username", username);
//     formData.append("password", password);
//     const response = await fetch("/api/auth/token", {
//       method: "POST",
//       body: formData,
//     });
//     if (response.status >= 400) {
//       const error = await response.json();
//       throw error.detail;
//     }
//     const data = await response.json();
//     this.storeTokens(data);
//   };

//   public logout = async () => {
//     const refreshToken = this.cookieService.get<string>("AuthService.refresh_token")
//     this.clearTokens();

//     await fetch("/api/auth/logout", {
//       method: "POST",
//       headers: { "content-type": "application/json" },
//       body: JSON.stringify({ token: refreshToken }),
//     });
//   };

//   // public async authorized_fetch(
//   //   url: string,
//   //   headers: any,
//   //   options: any
//   // ): Promise<AuthResponse> {
//   //   if (this.isAuthenticated()) {
//   //     await this.checkAccessToken();
//   //     const token = this.cookieService.get<string>("AuthService.access_token")
//   //     headers["Authorization"] = "Bearer " + token;
//   //   }
//   //   let response = await fetch(url, {
//   //     headers,
//   //     ...options,
//   //   });
//   //   response = await this.checkStatus(response);
//   //   return await response.json();
//   // };

//   private async checkStatus(response: Response): Promise<Response> {
//     if (response.status >= 200 && response.status < 300) {
//       return response;
//     } else {
//       const error = await response.json();
//       throw error.detail;
//     }
//   };

// }
