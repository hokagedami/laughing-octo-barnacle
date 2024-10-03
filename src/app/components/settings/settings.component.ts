import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Config } from "../../models/config";
import { ConfigService } from "../../services/config/config.service";
import { NgxToastAlertsService } from "ngx-toast-alerts";
import { NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from "@angular/common";
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgForOf
  ],
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  configs: Config[] = [];

  private toast = inject(NgxToastAlertsService);

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService
  ) {
    this.settingsForm = this.fb.group({});
  }

  async ngOnInit() {
    await this.loadSettings(); // Load settings asynchronously
  }

  async loadSettings() {
    try {
      this.configs = await this.configService.getConfigs(); // Wait for configs to load
      const formConfig: { [key: string]: any } = {};

      this.configs.forEach(config => {
        formConfig[config.name] = [config.value, Validators.required];
      });

      this.settingsForm = this.fb.group(formConfig); // Update form with configs

    } catch (error) {
      console.error('Error loading settings:', error);
      this.toast.error('Failed to load settings');
    }
  }

  async onSubmit() {
    if (this.settingsForm.valid) {
      try {
        this.configs = await this.configService.updateConfig(this.configs);  // Await the promise
        this.toast.success('Settings updated successfully');
      } catch (e: any) {
        this.toast.error(`Failed to update settings.\n${e.error.message}`);
      } finally {
        await this.loadSettings();  // Reload settings after submission
      }
    }
  }

  getInputType(config: Config): string {
    switch (config.type.toLowerCase()) {
      case 'boolean':
        return 'checkbox';
      case 'number':
        return 'number';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  }

  onConfigChange($event: Event, config: Config) {
    const target = $event.target as HTMLInputElement;
    let newValue: any;

    switch (config.type.toLowerCase()) {
      case 'boolean':
        newValue = target.checked ? 'true' : 'false';
        break;
      default:
        newValue = target.value;
    }

    // Update the form control value and mark it as dirty and touched
    const control = this.settingsForm.get(config.name);
    if (control) {
      control.setValue(newValue);
      control.markAsDirty(); // Mark the control as dirty (indicating a change)
      control.markAsTouched(); // Mark the control as touched (indicating user interaction)
    }

    // Update the configs array
    config.value = newValue;
    this.configs = this.configs.map(c => c.name === config.name ? config : c);
  }
}
