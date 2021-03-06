import { ContainedFieldSet } from '../contained/contained-field-set'
import { ContainedSetType } from '../dict-primitive'

export class MessageDefinition extends ContainedFieldSet {
  constructor (public readonly name: string,
               public readonly abbreviation: string,
               public readonly msgType: string,
               public readonly category: string,
               public readonly description: string) {
    super(ContainedSetType.Msg, name, category, abbreviation, description)
  }

  public getPrefix (): string {
    return `M.${this.msgType}`
  }
}
