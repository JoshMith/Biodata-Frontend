import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { LoginResponse } from '../auth/login/login.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // private baseUrl = 'https://cbms.adnyeri.org/api'; // Backend URL
  // private baseUrl = 'http://localhost:3000';  // Backend URL
  private baseUrl = 'https://biodata-backend-cbms.up.railway.app'

  constructor(private http: HttpClient) { }


  loginChristian(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data, { withCredentials: true });
  }
  registerChristian(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data, { withCredentials: true });
  }

  logoutChristian(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, data, { withCredentials: true });
  }

  // Request password reset email
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/request-password-reset`, { email });
  }

  // Verify reset token
  verifyResetToken(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/verify-reset-token`, {
      params: { token }
    });
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, {
      token,
      newPassword,
      confirmPassword
    });
  }

  getChristians(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { withCredentials: true });
  }

  getChristianById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`, { withCredentials: true });
  }
  getChristianByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/name/${name}`, { withCredentials: true });
  }

  getChristianCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/count`, { withCredentials: true });
  }

  addChristian(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, data, { withCredentials: true });
  }

  updateChristian(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, data, { withCredentials: true });
  }
  deleteChristian(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, { withCredentials: true });
  }

  getParishes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parish`, { withCredentials: true })
  }
  getParishById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/parish/${id}`, { withCredentials: true });
  }
  getParishByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/parish/name/${name}`, { withCredentials: true });
  }
  getParishByDeanery(deanery: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/parish/deanery/${deanery}`, { withCredentials: true });
  }

  updateParish(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/parish/${id}`, data, { withCredentials: true });
  }

  deleteParish(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/parish/${id}`, { withCredentials: true });
  }

  getBaptisms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/baptism`, { withCredentials: true });
  }
  getBaptismById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/baptism/${id}`, { withCredentials: true });
  }
  getBaptismByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/baptism/user/${userId}`, { withCredentials: true });
  }
  createBaptism(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/baptism`, data, { withCredentials: true });
  }
  updateBaptism(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/baptism/${id}`, data, { withCredentials: true });
  }
  deleteBaptism(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/baptism/${id}`, { withCredentials: true });
  }

  getEucharists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/eucharist`, { withCredentials: true });
  }
  getEucharistById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eucharist/${id}`, { withCredentials: true });
  }
  getEucharistByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eucharist/user/${userId}`, { withCredentials: true });
  }
  createEucharist(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/eucharist`, data, { withCredentials: true });
  }
  updateEucharist(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/eucharist/${id}`, data, { withCredentials: true });
  }
  deleteEucharist(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eucharist/${id}`, { withCredentials: true });
  }

  getConfirmations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/confirmation`, { withCredentials: true });
  }
  getConfirmationById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/confirmation/${id}`, { withCredentials: true });
  }
  getConfirmationByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/confirmation/user/${userId}`, { withCredentials: true });
  }
  createConfirmation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirmation`, data, { withCredentials: true });
  }
  updateConfirmation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/confirmation/${id}`, data, { withCredentials: true });
  }
  deleteConfirmation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/confirmation/${id}`, { withCredentials: true });
  }

  // Marriage Records
  createMarriage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/marriages`, data, { withCredentials: true });
  }

  getMarriages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/marriages`, { withCredentials: true });
  }

  getMarriageById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/marriages/${id}`, { withCredentials: true });
  }

  getFullMarriageByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/marriages/user/${userId}/full`, { withCredentials: true });
  }




  updateMarriage(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/marriages/${id}`, data, { withCredentials: true });
  }

  deleteMarriage(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/marriages/${id}`, { withCredentials: true });
  }

  // Marriage Parties
  createMarriageParty(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/marriage-parties`, data, { withCredentials: true });
  }

  deleteMarriageParty(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/marriage-parties/${id}`, { withCredentials: true })
  }


  // Marriage Documents
  createMarriageDocument(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(`${this.baseUrl}/marriage-documents`, formData, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events'
    });
  }

  // api.service.ts
  getDocumentUrl(filePath: string): string {
    if (!filePath) return '';

    // Just use the filename (already extracted on server)
    const filename = encodeURIComponent(filePath);
    return `${this.baseUrl}/marriage-documents/download/${filename}`;
  }

  downloadMarriageDocument(downloadUrl: string): Observable<Blob> {
    // Ensure URL is properly formatted
    let finalUrl = downloadUrl;

    if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('/')) {
      finalUrl = `/marriage-documents/download/${downloadUrl}`;
    }

    if (!finalUrl.startsWith('http')) {
      finalUrl = `${this.baseUrl}${finalUrl}`;
    }

    console.log('Final download URL:', finalUrl);

    return this.http.get(finalUrl, {
      responseType: 'blob',
      withCredentials: true,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('Empty response body');
        }
        return response.body;
      }),
      catchError(error => {
        console.error('Download error:', error);
        throw error;
      })
    );
  }

  getMarriageDocumentsList(marriageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/marriage-documents/list/${marriageId}`, {
      withCredentials: true
    });
  }



}
