export type TabRoute = 'index' | 'planner' | 'finance' | 'insights' | 'profile';

export interface TabConfig {
  name: TabRoute;
  title: string;
  tabBarLabel: string;
}
