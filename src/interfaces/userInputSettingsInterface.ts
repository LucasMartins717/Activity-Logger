export interface UserInputSettingsInterface {
    questionInterval: number;
    startTime: string;
    endTime: string;
    alwaysOn: boolean;
    weekDays: string[];
    questionScreenTime: number;
    notificationMode: 'popup' | 'toast' | 'off';
}