import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'convert'})
export class ConvertPipe implements PipeTransform {
  transform(value: any, type: string, df: any): any {
    if(value === undefined || value === null || value.length === 0) return df || (type === 'number' ? 0 : df);
    if(type === 'string') return value.toString();
    if(type === 'number') return parseInt(value);
    return value;
  }
}