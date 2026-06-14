/**
 * Nó "Dividir Mensagem" para n8n.
 * Desenvolvido por zanini · ninelabs.
 */
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionTypes,
  NodeOperationError,
} from 'n8n-workflow';

import { splitMessage, OversizedWordStrategy } from '../../splitter';

export class SplitMessage implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Dividir Mensagem',
    name: 'splitMessage',
    icon: 'file:splitMessage.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{ "máx " + $parameter["maxLength"] + " caracteres" }}',
    description:
      'Divide uma mensagem longa em um array de mensagens menores respeitando um limite máximo, sem cortar palavras. Desenvolvido por zanini · ninelabs.',
    defaults: {
      name: 'Dividir Mensagem',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    properties: [
      {
        displayName: 'Texto',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        description: 'A mensagem longa que será dividida',
      },
      {
        displayName: 'Limite Máximo',
        name: 'maxLength',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 4096,
        required: true,
        description: 'Número máximo de caracteres permitido por mensagem',
      },
      {
        displayName: 'Estratégia para Palavra Maior que o Limite',
        name: 'strategy',
        type: 'options',
        options: [
          {
            name: 'Dividir a Palavra',
            value: 'hard-split',
            description:
              'Divide uma palavra maior que o limite para que nenhuma parte ultrapasse o máximo',
          },
          {
            name: 'Manter a Palavra',
            value: 'keep-word',
            description:
              'Entrega a palavra maior que o limite como uma parte própria, sem cortá-la',
          },
        ],
        default: 'hard-split',
        description: 'Como tratar uma única palavra maior que o limite máximo',
      },
      {
        displayName: 'Nome do Campo de Saída',
        name: 'outputField',
        type: 'string',
        default: 'parts',
        description: 'Nome do campo que conterá o array com as mensagens divididas',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const text = this.getNodeParameter('text', i) as string;
        const maxLength = this.getNodeParameter('maxLength', i) as number;
        const strategy = this.getNodeParameter('strategy', i) as OversizedWordStrategy;
        const outputField = (this.getNodeParameter('outputField', i) as string) || 'parts';

        const parts = splitMessage(text, maxLength, { strategy });

        returnData.push({
          json: {
            ...items[i].json,
            [outputField]: parts,
            count: parts.length,
          },
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { ...items[i].json, error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
