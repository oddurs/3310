export function createEventHandler(sounds, isAudioEnabled) {
  function handle(evt) {
    if (!isAudioEnabled()) return
    switch (evt.event) {
      case 'moved':    sounds.move(); break
      case 'ate':      sounds.eat(); break
      case 'bonusAte': sounds.eatBonus(); break
      case 'died':     sounds.die(); break
      case 'start':    sounds.start(); break
      case 'levelUp':  sounds.levelUp(); break
    }
  }

  return { handle }
}
