import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgForOf } from "@angular/common";
import { Router } from "@angular/router";
import {EventService} from "../../../services/event/event.service";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-feedback-consent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './feedback-consent.component.html',
  styleUrl: './feedback-consent.component.css'
})
export class FeedbackConsentComponent implements OnInit {
  consentForm!: FormGroup;
  consentStatements: string[] = [
    'I confirm that I have read and understood the information sheet explaining the Logic Gates Simulator research project and I have had the opportunity to ask questions about the project.',
    'I understand that the study will involve a short session using the Logic Gates Simulator and a brief survey about my experience.',
    'I understand that my participation is voluntary and should I not wish to answer any particular question or questions or submit my responses, I am free to decline. I understand that once I submit my responses I cannot withdraw as the survey is anonymous.',
    'I understand that when I submit my responses, I agree that researchers may use my data in publications, reports, web pages, and other research outputs.',
    'I understand that it is my responsibility to make sure that I don\'t include anything that could be used to identify me in my responses.',
    'By Clicking "Next" I consent to participate.'
  ];

  constructor(private fb: FormBuilder, private router: Router, private cookieService: CookieService) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.consentForm = this.fb.group({});
    this.consentStatements.forEach((_, index) => {
      this.consentForm.addControl(`statement${index}`, this.fb.control(false, Validators.requiredTrue));
    });
  }

  onSubmit() {
    if (this.consentForm.valid) {
      this.cookieService.set('feedbackConsent', 'true', 365, '/');
      this.router.navigate(['/feedbacks/form']);
    } else {
      console.log('Form is invalid');
    }
  }

  clearForm() {
    this.consentForm.reset();
  }
}
