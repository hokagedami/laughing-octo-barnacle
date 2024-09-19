import { Injectable } from '@angular/core';
import Anthropic from "@anthropic-ai/sdk";
// import {environment} from "../../../environment/env";

@Injectable({
  providedIn: 'root'
})
export class ClaudeService {

  private apiKey = process.env['CLAUDE_API_KEY'];

  private anthropic = new Anthropic({apiKey: this.apiKey, dangerouslyAllowBrowser: true});

  async verifyLogicGateCircuit(imageData: string): Promise<any> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageData.split(',')[1]
              }
            },
            {
              type: 'text',
              text: 'Verify the logic gate circuit with a percentage of confidence. Only respond with the confidence percentage.'
            }
          ]
        }
      ],
      max_tokens: 1000
    });
    return response.content;
  }

  async verifyLogicGateCircuitWithQuestion(imageData: string, question: string): Promise<any> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageData.split(',')[1]
              }
            },
            {
              type: 'text',
              text: `Using the question that follows: ${question}, Verify the logic gate circuit with a percentage of confidence. Only respond with the confidence percentage.`
            }
          ]
        }
      ],
      max_tokens: 1000
    });
    return response.content;
  }
}
