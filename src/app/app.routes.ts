import { Routes } from '@angular/router';
import {StartComponent} from "./components/start/start.component";
import {TutorialHomeComponent} from "./components/tutorials/tutorial-home/tutorial-home.component";
import {ChallengesHomeComponent} from "./components/challenges/home/challenges-home.component";
import {SimulatorHomeComponent} from "./components/simulator/simulator-home/simulator-home.component";
import {AuthGuard} from "./services/auth/auth.guard";
import {LoginComponent} from "./components/login/login.component";

export const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'login', component: LoginComponent},
  { path: 'tutorials', component: TutorialHomeComponent },
  { path: 'challenges', component: ChallengesHomeComponent, canActivate: [AuthGuard] },
  { path: 'simulator', component: SimulatorHomeComponent },
  { path: 'feedbacks', loadChildren: () => import('./components/feedback/feedbacks.module')
      .then(m => m.FeedbacksModule) },
  { path: '**', redirectTo: '' }
];
