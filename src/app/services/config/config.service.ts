import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from "../../models/config";

export interface ConfigApiResponse {
  id: number;
  data: Config[];
  message: string;
  statusCode: number;
}

export interface ConfigUpdateObject {
  id: number;
  value: string;
}


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_URL = 'https://logicpulseapi-drdhbrgactdadtbc.uksouth-01.azurewebsites.net/api/Config';
  private configs: Config[] = [];

  constructor(private http: HttpClient) {
    this.loadConfig().catch(console.error);
  }

  // Make loadConfig return a Promise
  private loadConfig(): Promise<Config[]> {
    return new Promise((resolve, reject) => {
      this.http.get<ConfigApiResponse>(this.API_URL).subscribe({
        next: (response: ConfigApiResponse) => {
          // Update the internal configs array with the response data
          this.configs = response.data;
          resolve(this.configs); // Resolve the promise with the loaded configs
        },
        error: (error) => {
          console.error('Error loading config:', error);
          reject(error); // Reject the promise on error
        }
      });
    });
  }

  // Make getConfigs asynchronous and wait for the API call to complete
  async getConfigs(): Promise<Config[]> {
    try {
      return await this.loadConfig(); // Load the configs and return them
    } catch (error) {
      console.error('Error loading configs:', error);
      throw error; // Rethrow the error to the caller
    }
  }

  // You can keep the non-observable method as is if you don't need async for this one
  getNonObservableConfigs(): Config[] {
    return this.configs;
  }

  // Update config method still can return Config array
  updateConfig(updatedConfigs: Config[]): Promise<Config[]> {
    const toUpdatedConfigs = updatedConfigs.map(config => ({
      id: config.id,
      value: config.value
    })) as ConfigUpdateObject[];

    // Return a promise that resolves when the HTTP call completes
    return new Promise((resolve, reject) => {
      this.http.post<ConfigApiResponse>(`${this.API_URL}/update`, toUpdatedConfigs).subscribe({
        next: (response: ConfigApiResponse) => {
          // Update the internal configs array with the response data
          this.configs = response.data;
          resolve(this.configs);  // Resolve the promise with the updated configs
        },
        error: (error) => {
          console.error('Error updating config:', error);
          reject(error);  // Reject the promise on error
        }
      });
    });
  }
}

