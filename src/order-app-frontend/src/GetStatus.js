import React from 'react';
// import {Glyphicon, Badge} from 'react-bootstrap';

const icons = {
  running: (<span className="glyphicon glyphicon-flash" aria-hidden="true"></span>),
  waiting: (<span className="glyphicon glyphicon-flash" aria-hidden="true"></span>),
  done:    (<span className="glyphicon glyphicon-ok" aria-hidden="true"></span>),
  notyet:  (<span className="glyphicon glyphicon-remove" aria-hidden="true"></span>)
};

const statuses = [
  {
    name: 'Order validation',
    value: 'notyet'
  },
  {
    name: 'Your payment',
    value: 'notyet'
  },
  {
    name: 'Restaurant approval',
    value: 'notyet'
  },
  {
    name: 'Driver assignment',
    value: 'notyet'
  }
];

const createBar = (statusBar) => {
  return (
    <div>
      {statusBar.map((s,i) => {
        return (
          <span key={i}>
            {icons[s.value]} -
            {s.value === 'running' ? (<b style={{color: 'green'}}>{s.name}</b>) : s.name}
            <br/>
          </span>
        );
      })}
    </div>
  );
};

export default ({order_valid, payment_valid, approved, driver_assigned}) => {
  const statusBar = JSON.parse(JSON.stringify(statuses));
  if (!(order_valid)) {
    statusBar[0].value = 'running';
    return createBar(statusBar);
  } else if (order_valid && !payment_valid) {
    statusBar[0].value = 'done';
    statusBar[1].value = 'running';
    return createBar(statusBar);
  } else if (payment_valid && !approved) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='running';
    return createBar(statusBar);
  } else if (approved && !driver_assigned) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='done';
    statusBar[3].value ='running';
    return createBar(statusBar);
  } else if (driver_assigned) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='done';
    statusBar[3].value ='done';
    return createBar(statusBar);
  } else {
    return (<span className="badge badge-secondary">!?! 'Unknown state'</span>);
  }
};
