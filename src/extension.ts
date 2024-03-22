import * as vscode from "vscode";
import { WebClient } from "@slack/web-api";

const token = "xoxp-6842186170917-6857766016257-6867969372448-f585b7f89af51423ad6b5a693a007884";
const client = new WebClient(token);

const statusBarIcon: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
statusBarIcon.text = "$(pulse) Connecting to Slack...";
statusBarIcon.show();

const enable = async () => {
  await client.users.profile
    .set({
      profile: {
        status_text: "Working on VS Code",
        status_emoji: ":technologist:",
        status_expiration: 0,
      },
    })
    .then((_) => {
      statusBarIcon.text = "$(globe) Connected to Slack";
      statusBarIcon.tooltip = "Connected to Slack";
      statusBarIcon.show();
    })
    .catch((error) => {
      statusBarIcon.text = "$(alert) Error connecting to Slack";
      statusBarIcon.tooltip = "Error connecting to Slack";
      statusBarIcon.show();
      console.error(error);
    });

  vscode.window.showInformationMessage("Slack Presence is now active!");
};

export async function activate(context: vscode.ExtensionContext) {
  const enabler = vscode.commands.registerCommand("slack-presence.enable", async () => {
    await enable();
  });

  context.subscriptions.push(enabler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
