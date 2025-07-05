import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../login/login.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // private baseUrl = 'https://christian-biodata-backend.onrender.com'; // Backend URL
  private baseUrl = 'http://localhost:3000';  // Backend URL

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

  // logoutChristian(data: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/auth/logout`, data);
  // }



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

  // Marriage Documents
  createMarriageDocument(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(`${this.baseUrl}/marriage-documents`, formData, { 
      withCredentials: true,
      reportProgress: true,
      observe: 'events'
    });
  }

  getDocumentUrl(filePath: string): string {
    // Convert backslashes to forward slashes for proper URL formatting
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Check if the path already contains the base URL
    if (normalizedPath.startsWith('http')) {
        return normalizedPath;
    }
    
    // Prepend the base URL if it's a local path
    return `${this.baseUrl}/${normalizedPath}`;
}

}
