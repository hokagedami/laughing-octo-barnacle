import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf} from "@angular/common";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  settingKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService
  ) {
    this.settingsForm = this.fb.group({});
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.configService.getConfig().subscribe((config: any) => {
      this.settingKeys = Object.keys(config);
      const formConfig: {[key: string]: any} = {};

      this.settingKeys.forEach(key => {
        formConfig[key] = [config[key], Validators.required];
      });

      this.settingsForm = this.fb.group(formConfig);
    });
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      this.configService.updateConfig(this.settingsForm.value).subscribe(
        () => {
          console.log('Settings updated successfully');
          // load the updated settings
          this.loadSettings();
          // You might want to show a success message to the user here
        },
        (error: any) => {
          console.error('Error updating settings', error);
          // You might want to show an error message to the user here
        }
      );
    }
  }

  getInputType(key: string): string {
    if (key.toLowerCase().includes('password')) {
      return 'password';
    }
    if (typeof this.settingsForm.get(key)?.value === 'number') {
      return 'number';
    }
    if (typeof this.settingsForm.get(key)?.value === 'boolean') {
      return 'checkbox';
    }
    return 'text';
  }
}
