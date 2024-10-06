export enum TEventTypesCore {
  GameStateLeft = 'game_state_left',
  GameStateCreated = 'game_state_created',
  GameStateEntered = 'game_state_entered',
  GameStateResumed = 'game_state_resumed',
}

export interface TGameStateLeftEvent {
  type: TEventTypesCore.GameStateLeft;
}

export interface TGameStateCreatedEvent {
  type: TEventTypesCore.GameStateCreated;
}

export interface TGameStateEnteredEvent {
  type: TEventTypesCore.GameStateEntered;
}

export interface TGameStateResumedEvent {
  type: TEventTypesCore.GameStateResumed;
}
