
import 'jsdom-global/register';
import React from 'react';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';
import Adapter from 'enzyme-adapter-react-16';
import expect from 'expect';
import Enzyme, { mount } from 'enzyme';
import sinon from 'sinon';
import { shallowToJson } from 'enzyme-to-json';
import Registration from '../components/Registration';

Enzyme.configure({ adapter: new Adapter() });

const fakeSubmit = sinon.spy();
const fakeOnChange = sinon.spy();

function setup() {
  const options = new ReactRouterEnzymeContext();
  const props = {
    state: {
      payload: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
    },
    onSubmit: fakeSubmit,
    onChange: fakeOnChange,
  };
  return mount(
    <Registration {...props} />,
    options.get(),
  );
}

describe('Register Component', () => {
  const wrapper = setup();
  wrapper.instance().handleOnSubmit({ preventDefault() { } });

  it('renders without crashing', () => {
    expect(shallowToJson(<Registration />)).toMatchSnapshot();
  });
  it('renders state initially', () => {
    expect(wrapper.state().payload.first_name).toEqual('');
    expect(wrapper.state().payload.last_name).toEqual('');
    expect(wrapper.state().payload.email).toEqual('');
    expect(wrapper.state().payload.password).toEqual('');
  });
  it('renders appropriate number of inputs', () => {
    expect(wrapper.find('input').length).toEqual(5);
  });
  it('should have one submit  button', () => {
    expect(wrapper.find('button').length).toEqual(1);
  });
  it('should have a submit prop', () => {
    expect(wrapper.prop('onSubmit')).toBeDefined();
  });
  it('should have one one form element', () => {
    expect(wrapper.find('form').length).toEqual(1);
  });
  it('should call onsubmit when form is submitted', () => {
    const form = wrapper.find('form');
    form.instance().onSubmit = sinon.spy();
    form.simulate('submit');
    expect(fakeSubmit.calledOnce).toBe(false);
  });
});
