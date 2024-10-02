import {Component, inject, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgForOf, NgIf } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {NgxToastAlertsService} from "ngx-toast-alerts";
import {CookieService} from "ngx-cookie-service";

interface Question {
  id: number;
  text: string;
  type: number;
  options: string[];
}

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.css'
})
export class FeedbackFormComponent implements OnInit {
  surveyForm!: FormGroup;
  questions: Question[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private cookieService: CookieService) {}

  private toast = inject(NgxToastAlertsService);

  private apiUrl = process.env['API_URL'];
  surveySubmitted: boolean = false;

  ngOnInit() {
    this.surveySubmitted = false;
    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get<Question[]>(`${this.apiUrl}/api/Feedback/questions`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (data) => {
          if (this.isValidQuestionData(data)) {
            this.questions = data;
            this.initForm();
            this.loading = false;
          } else {
            this.handleInvalidData();
          }
        },
        error: (error) => {
          this.error = true;
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  private isValidQuestionData(data: any): data is Question[] {
    if (!Array.isArray(data)) return false;
    return data.every(item =>
      typeof item.id === 'number' &&
      typeof item.text === 'string' &&
      typeof item.type === 'number' &&
      Array.isArray(item.options)
    );
  }

  private handleInvalidData() {
    this.error = true;
    this.errorMessage = 'Received invalid data from the server. Please try again later.';
    this.loading = false;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg: string;
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `An error occurred: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }
    return throwError(() => new Error(errorMsg));
  }

  initForm() {
    const formControls: {[key: string]: FormControl} = {};
    this.questions.forEach(question => {
      formControls[question.id] = new FormControl('', Validators.required);
    });
    this.surveyForm = this.fb.group(formControls);
  }

  onSubmit() {
    if (this.surveyForm.valid) {
      const responses = Object.entries(this.surveyForm.value).map(([questionId, response]) => {
        return { questionId: parseInt(questionId), answer: response };
      });
      // Handle form submission to api
      this.http.post(`${this.apiUrl}/api/Feedback/submit`, {responses})
        .pipe(
          catchError(this.handleError)
        )
        .subscribe({
          next: () => {
            this.toast.success('Form submitted successfully!');
            this.clearForm();
            this.surveySubmitted = true;
          },
          error: (error) => {
            this.toast.error('An error occurred while submitting the form. Please try again later.');
            this.surveySubmitted = false;
            this.handleError(error);
          }
        });
    }
  }

  clearForm() {
    this.surveyForm.reset();
  }

  getQuestionType(type: number): string {
    switch(type) {
      case 0: return 'Likert';
      case 1: return 'Satisfaction';
      case 2: return 'Recommendation';
      default: return 'Unknown';
    }
  }

  ReloadSurvey() {
    this.clearForm();
    this.cookieService.delete('feedbackConsent', '/');
    this.surveySubmitted = false;
    // reload the page
    window.location.reload();
  }
}
