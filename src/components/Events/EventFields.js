import React from 'react';
import { FormGroup, Label, Input } from 'reactstrap';

export default function EventField({ name, label, value, onChange, ...props }) {
  return <FormGroup>
    <Label for={`events-${name}`}>{label}{props.required ? ' *' : ''}</Label>
    {props.type === 'select' ? (
      <select {...props} type={undefined} className="form-control" id={`events-${name}`} name={name}
        value={value} onChange={event => onChange(name, event.target.value)} />
    ) : <Input id={`events-${name}`} name={name} value={value} onChange={event => onChange(name, event.target.value)} {...props} />}
  </FormGroup>;
}
