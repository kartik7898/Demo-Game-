import { CharacterId, DialogueLine } from '../types/game';

export const INTRO_SCRIPT: DialogueLine[] = [
  {
    speaker: 'Nigel Billingsley',
    avatarId: 'nigel',
    text: 'Welcome to Jumanji! I am Nigel Billingsley, your guide. A dire curse has befallen our land!',
  },
  {
    speaker: 'Nigel Billingsley',
    avatarId: 'nigel',
    text: 'Russell Van Pelt stole the sacred Jewel of Jumanji from the Jaguar Shrine. You must lift the curse!',
  },
  {
    speaker: 'Nigel Billingsley',
    avatarId: 'nigel',
    text: 'Guard your forearm tattoos—they are your lives. Three strikes and it is GAME OVER forever! Return the jewel and shout JUMANJI!',
  },
];

export const LEVEL_DIALOGUES: Record<number, DialogueLine[]> = {
  1: [
    {
      speaker: 'Spencer (Bravestone)',
      avatarId: 'bravestone',
      text: 'Whoa... look at my biceps. Why am I enormous?! Why is my chest twitching?!',
      mood: 'heroic',
    },
    {
      speaker: 'Fridge (Mouse)',
      avatarId: 'mouse',
      text: 'Man, why am I carrying a giant backpack?! And where are the rest of my feet?! I lost like two feet of height!',
      mood: 'panic',
    },
    {
      speaker: 'Van Pelt Henchman',
      avatarId: 'van_pelt',
      text: 'Motorcycles roaring through the bazaar! Stop those intruders before they reach the jungle trail!',
      mood: 'danger',
    },
    {
      speaker: 'Martha (Ruby)',
      avatarId: 'ruby',
      text: 'Why am I wearing half a shirt in a tropical jungle?! Whatever, let\'s move!',
      mood: 'sarcastic',
    },
  ],
  2: [
    {
      speaker: 'Bethany (Shelly)',
      avatarId: 'shelly',
      text: 'Wait! Look at this parchment. Only a Cartographer can read the runes on this trail!',
      mood: 'heroic',
    },
    {
      speaker: 'Fridge (Mouse)',
      avatarId: 'mouse',
      text: 'Watch out for that mud! That is not mud, that is quicksand! And I see hippos lurking in the reeds!',
      mood: 'panic',
    },
    {
      speaker: 'Spencer (Bravestone)',
      avatarId: 'bravestone',
      text: 'Stay behind me! Ruby, take the dart blowers. Shelly, decipher the stone wheel gate!',
      mood: 'smolder',
    },
  ],
  3: [
    {
      speaker: 'Fridge (Mouse)',
      avatarId: 'mouse',
      text: 'DO YOU HEAR THAT RUMBLING?! That is NOT thunder! That is a herd of Albino Bighorn Rhinos!',
      mood: 'panic',
    },
    {
      speaker: 'Martha (Ruby)',
      avatarId: 'ruby',
      text: 'They\'re charging through the canyon gorge! Keep running and jump across the rock ledges!',
      mood: 'danger',
    },
    {
      speaker: 'Spencer (Bravestone)',
      avatarId: 'bravestone',
      text: 'Mouse, hand me the boomerang! I\'ll shatter the canyon boulders to slow their charge!',
      mood: 'heroic',
    },
  ],
  4: [
    {
      speaker: 'Spencer (Bravestone)',
      avatarId: 'bravestone',
      text: 'The abandoned airstrip! There\'s an old vintage helicopter in the hangar!',
      mood: 'heroic',
    },
    {
      speaker: 'Bethany (Shelly)',
      avatarId: 'shelly',
      text: 'It\'s missing parts! We need the turbine gear, fuel conduit, and flight rotor before snipers surround us!',
      mood: 'panic',
    },
    {
      speaker: 'Fridge (Mouse)',
      avatarId: 'mouse',
      text: 'Someone cover me while I bolt the engine! And whatever you do, DO NOT feed me cake!',
      mood: 'sarcastic',
    },
  ],
  5: [
    {
      speaker: 'Russell Van Pelt',
      avatarId: 'van_pelt',
      text: 'You fools cannot undo the curse! The Jewel belongs to the shadows of Jumanji now!',
      mood: 'danger',
    },
    {
      speaker: 'Martha (Ruby)',
      avatarId: 'ruby',
      text: 'Spencer! You have the Jewel! Climb the Jaguar Rock scaffolding to the eye socket!',
      mood: 'heroic',
    },
    {
      speaker: 'Spencer (Bravestone)',
      avatarId: 'bravestone',
      text: 'Team, keep Van Pelt\'s shadows off me! When the Jewel locks in, we shout it together!',
      mood: 'smolder',
    },
  ],
};

export const RESPAWN_TAUNTS: Record<CharacterId, string[]> = {
  bravestone: [
    'Bravestone plummets from the stratosphere! "WHOA! That was a long drop!"',
    '"I fell from the sky... and made a crater!" *Smoldering intensity restored*',
  ],
  ruby: [
    'Ruby crash-lands into the dirt! "Ugh! I hate respawning in mid-air!"',
    '"Two tattoos left! Nobody get stung by another snake!"',
  ],
  shelly: [
    'Shelly thuds down! "MY HAIR! MY HAT! Is my backpack okay?!"',
    '"I just plummeted five thousand feet! I need water!"',
  ],
  mouse: [
    'Mouse hits the earth with an enormous thud! "WHY CAN\'T WE RESPAWN GENTLY?!"',
    '"Man, my ribs hurt! And who left cake on the ground?!"',
  ],
};
