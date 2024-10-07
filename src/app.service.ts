import { Injectable } from '@nestjs/common';

interface Node {
  tagName?: string;
  children: Node[];
}

@Injectable()
export class AppService {
  async run() {
    const url = process.argv[2];
    if (!url) {
      console.error('Please provide a URL as a command line argument.');
      process.exit(1);
    }

    try {
      const html = await this.getHTMLContent(url);
      const tokens = this.tokenize(html);
      const root = this.parse(tokens);
      const maxUlCount = this.findMaxUl(root);
      console.log(maxUlCount);
    } catch (err: any) {
      console.error('Error:', err.message);
    }
  }

  async getHTMLContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.text();
  }

  tokenize(html: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        let tag = '<';
        i++;
        while (i < html.length && html[i] !== '>') {
          tag += html[i];
          i++;
        }
        if (i < html.length && html[i] === '>') {
          tag += '>';
          i++;
        }
        tokens.push(tag);
      } else {
        let text = '';
        while (i < html.length && html[i] !== '<') {
          text += html[i];
          i++;
        }
        tokens.push(text);
      }
    }
    return tokens;
  }

  parse(tokens: string[]): Node {
    const root: Node = { children: [] };
    const stack: Node[] = [root];

    for (const token of tokens) {
      if (token.startsWith('<')) {
        if (token[1] === '/') {
          const tagName = token.slice(2, -1).trim();
          if (stack.length > 1 && stack[stack.length - 1].tagName === tagName) {
            stack.pop();
          }
        } else {
          const isSelfClosing = token.endsWith('/>');
          const tagContent = token.slice(1, isSelfClosing ? -2 : -1).trim();
          const spaceIndex = tagContent.indexOf(' ');
          const tagName =
            spaceIndex === -1 ? tagContent : tagContent.slice(0, spaceIndex);

          const node: Node = {
            tagName: tagName,
            children: [],
          };

          stack[stack.length - 1].children.push(node);

          if (!isSelfClosing) {
            stack.push(node);
          }
        }
      }
    }

    return root;
  }

  findMaxUl(root: Node): number {
    let maxCount = 0;

    function traverse(node: Node) {
      if (node.tagName === 'ul') {
        const count = node.children.filter(
          (child) => child.tagName === 'li',
        ).length;
        if (count > maxCount) {
          maxCount = count;
        }
      }
      for (const child of node.children) {
        traverse(child);
      }
    }

    traverse(root);
    return maxCount;
  }
}
