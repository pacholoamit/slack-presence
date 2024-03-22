import * as vscode from "vscode";
import { WebClient } from "@slack/web-api";
import { activity } from "./activity";
import { throttle } from "./util";

const token = "xoxp-6842186170917-6857766016257-6845711674066-ba0b433cbf0fcc5b5141e0e40fa14cc6";
const client = new WebClient(token);

let state = {};
let listeners: { dispose: () => any }[] = [];

const statusBarIcon: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
statusBarIcon.text = "$(pulse) Connecting to Slack...";
statusBarIcon.show();

const sendActivity = async () => {
  state = {
    ...(await activity(state)),
  };
  console.log(`Sending activity`, state);
};

const onChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => sendActivity());
const onChangeTextDocument = vscode.workspace.onDidChangeTextDocument(throttle(() => sendActivity(), 2000));
const onStartDebugSession = vscode.debug.onDidStartDebugSession(() => sendActivity());
const onTerminateDebugSession = vscode.debug.onDidTerminateDebugSession(() => sendActivity());

listeners.push(onChangeActiveTextEditor, onChangeTextDocument, onStartDebugSession, onTerminateDebugSession);

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
  console.log("Activating Slack Presence");
  const enabler = vscode.commands.registerCommand("slack-presence.enable", async () => {
    await enable();
  });

  context.subscriptions.push(enabler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
