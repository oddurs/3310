export function createEventHandler(sounds, interaction, isAudioEnabled) {
  function handle(evt) {
    if (isAudioEnabled()) {
      switch (evt.event) {
        case 'moved':
          sounds.move()
          break
        case 'ate':
          sounds.eat()
          break
        case 'bonusAte':
          sounds.eatBonus()
          break
        case 'died':
          sounds.die()
          break
        case 'start':
          sounds.start()
          break
        case 'levelUp':
          sounds.levelUp()
          break
      }
    }
    // Screen pulse only on notable events (not every move tick)
    if (evt.event === 'ate' || evt.event === 'bonusAte' || evt.event === 'start' || evt.event === 'levelUp') {
      interaction.triggerPulse()
    }
  }

  return { handle }
}
