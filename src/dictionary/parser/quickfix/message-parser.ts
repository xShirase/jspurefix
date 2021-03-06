import { ISaxNode } from '../../dict-primitive'
import { MessageDefinition } from '../../definition/message-definition'
import { NodeParser } from './node-parser'
import { ParseContext } from './parse-context'
import { QuickFixXmlFileParser } from './quick-fix-xml-file-parser'

export class MessageParser extends NodeParser {

  constructor (public readonly parser: QuickFixXmlFileParser) {
    super(parser)
  }

  public open (line: number, node: ISaxNode): void {
    switch (node.name) {
      case 'message': {
        const att: any = node.attributes
        const msg: MessageDefinition = new MessageDefinition(att.name, att.name, att.msgtype, att.msgcat, null)
        const context: ParseContext = new ParseContext(msg.name, true, msg)
        this.parseContexts.push(context)
        break
      }

      case 'field': {
        this.addSimple(node)
        break
      }

      case 'component': {
        if (node.isSelfClosing) {
          this.addComponentField(node.attributes.name, node)
        }
        break
      }

      case 'group': {
        if (!node.isSelfClosing) {
          this.beginGroupDefinition(node)
        }
        break
      }
    }
  }

  public close (line: number, name: string): void {
    switch (name) {
      case 'message': {
        const parent: ParseContext = this.parseContexts.pop()
        const message: MessageDefinition = parent.asMessage()
        if (message != null) {
          this.definitions.addMessage(message)
        }
        break
      }

      case 'group': {
        this.addGroupField(name)
        break
      }
    }
  }
}
