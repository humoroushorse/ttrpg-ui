import { Pipe, PipeTransform } from '@angular/core';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { choiceLabel, codeLabel, signed } from './breakdown';
import { spellName } from './sheet-changes';

/** A sheet code as a label: {{ 'sleight_of_hand' | codeLabel }} -> Sleight of Hand, int -> Int */
@Pipe({ name: 'codeLabel' })
export class CodeLabelPipe implements PipeTransform {
  transform(code: string): string {
    return codeLabel(code);
  }
}

/** A bonus with its sign: {{ 2 | signed }} -> +2 */
@Pipe({ name: 'signed' })
export class SignedPipe implements PipeTransform {
  transform(n: number): string {
    return signed(n);
  }
}

/** What a choice picked: {{ choice | choiceLabel }} -> Human, Arcana, +2 Cha, +1 Dex */
@Pipe({ name: 'choiceLabel' })
export class ChoiceLabelPipe implements PipeTransform {
  transform(choice: DndCharacterModels.Characters.CharacterChoice): string {
    return choiceLabel(choice);
  }
}

/** A granted spell's name: {{ spell | spellName }} -> Misty Step */
@Pipe({ name: 'spellName' })
export class SpellNamePipe implements PipeTransform {
  transform(spell: DndCharacterModels.Sheet.GrantedSpell): string {
    return spellName(spell);
  }
}
