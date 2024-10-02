import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {FeedbackFormComponent} from "./feedback-form/feedback-form.component";
import {FeedbackConsentComponent} from "./feedback-consent/feedback-consent.component";
import {SurveyConsentGuard} from "../../services/auth/survey-guard";

const routes: Routes = [
  { path: 'consent', component: FeedbackConsentComponent },
  { path: 'form', component: FeedbackFormComponent, canActivate: [SurveyConsentGuard] }

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class FeedbacksModule { }
