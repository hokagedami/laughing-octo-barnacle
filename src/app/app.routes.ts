import { Routes } from '@angular/router';
import {StartComponent} from "./components/start/start.component";
import {TutorialHomeComponent} from "./components/tutorials/tutorial-home/tutorial-home.component";
import {ChallengesHomeComponent} from "./components/challenges/home/challenges-home.component";
import {SimulatorHomeComponent} from "./components/simulator/simulator-home/simulator-home.component";

export const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'tutorials', component: TutorialHomeComponent },
  { path: 'challenges', component: ChallengesHomeComponent },
  {path: 'simulator', component: SimulatorHomeComponent }
];
