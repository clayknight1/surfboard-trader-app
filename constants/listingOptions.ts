import { BoardType, FinSystem, FinSetup, BoardCondition } from '../lib/types';

export const BOARD_TYPE_OPTIONS: { label: string; value: BoardType }[] = [
  { label: 'Shortboard', value: 'shortboard' },
  { label: 'Longboard', value: 'longboard' },
  { label: 'Midlength', value: 'midlength' },
  { label: 'Fish', value: 'fish' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Groveler', value: 'groveler' },
  { label: 'Step Up', value: 'step_up' },
  { label: 'Gun', value: 'gun' },
  { label: 'Soft Top', value: 'soft_top' },
  { label: 'SUP', value: 'sup' },
  { label: 'Foilboard', value: 'foilboard' },
  { label: 'Other', value: 'other' },
];

export const FIN_SYSTEM_OPTIONS: { label: string; value: FinSystem }[] = [
  { label: 'FCS II', value: 'fcs2' },
  { label: 'Futures', value: 'futures' },
  { label: 'FCS I', value: 'fcs1' },
  { label: 'Single', value: 'single' },
  { label: 'Other', value: 'other' },
  { label: 'Unknown', value: 'unknown' },
];

export const FIN_SETUP_OPTIONS: { label: string; value: FinSetup }[] = [
  { label: 'Thruster', value: 'thruster' },
  { label: 'Twin', value: 'twin' },
  { label: 'Quad', value: 'quad' },
  { label: 'Single', value: 'single' },
  { label: '2+1', value: '2_plus_1' },
  { label: 'Five Fin', value: 'five_fin' },
  { label: 'Other', value: 'other' },
];

export const CONDITION_OPTIONS: { label: string; value: BoardCondition }[] = [
  { label: 'New', value: 'new' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

export const BOARD_ERA_OPTIONS = [
  { label: '1950s', value: '1950s' },
  { label: '1960s', value: '1960s' },
  { label: '1970s', value: '1970s' },
  { label: '1980s', value: '1980s' },
  { label: '1990s', value: '1990s' },
  { label: '2000s', value: '2000s' },
  { label: '2010s', value: '2010s' },
  { label: '2020s', value: '2020s' },
];

export const SHAPER_BRAND_OPTIONS = [
  'Aipa',
  'AJW',
  'Album',
  'Barr',
  'Becker',
  'Bing',
  'Borst Designs',
  'Byrne',
  'Channel Islands',
  'Chemistry',
  'Chili',
  'Chris Christenson',
  'Cole',
  'DHD',
  'Firewire',
  'Hayden Shapes',
  'JS',
  '...Lost',
  'McTavish',
  'Modern',
  'Panda',
  'Proctor',
  'Pyzel',
  'Roberts',
  'Rusty',
  'Sharp Eye',
  'Slater Designs',
  'Stamps',
  'Stretch',
  'Super',
  'Timmy Patterson',
  'Tokoro',
  'Tomo',
  'Von Sol',
  'Walden',
  'Xanadu',
];
