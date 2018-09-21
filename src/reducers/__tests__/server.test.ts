import {
  reduceServer,
  serverInitialState,
  ServerState,
} from '@app/reducers/server'
import { closeWindow } from '@app/actions/ui'
import { messageReceivers } from '@app/actions/msgIncoming'
import { User } from '@app/utils/Message'
import { BufferKey } from '@app/utils/Route'
import { bufferInitialState } from '@app/reducers/buffer'

describe('reduce server state', () => {
  const initialState: ServerState = {
    ...serverInitialState,
    user: { nick: 'me', user: 'user', real: 'Realname' },
    buffers: {
      ...serverInitialState.buffers,
      '#channel': bufferInitialState,
    },
  }

  const extraStates = {
    route: { serverKey: 'serverKey', bufferKey: '#channel' },
  }

  it('should handle CLOSE_WINDOW on status', () => {
    expect(
      reduceServer(
        initialState,
        closeWindow({
          serverKey: 'serverKey',
          bufferKey: BufferKey.STATUS,
        }),
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should handle CLOSE_WINDOW on channel', () => {
    expect(
      reduceServer(
        initialState,
        closeWindow({ serverKey: 'serverKey', bufferKey: '#channel' }),
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should handle CLOSE_WINDOW on private', () => {
    expect(
      reduceServer(
        initialState,
        closeWindow({ serverKey: 'serverKey', bufferKey: 'nick' }),
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  describe('when it is someone', () => {
    const someone: User = { nick: 'someone', user: 'user', host: 'host' }

    it('should handle RECEIVE_NICK', () => {
      expect(
        reduceServer(
          initialState,
          messageReceivers.NICK('serverKey', someone, ['new_nick']),
          extraStates,
        ),
      ).toMatchSnapshot()
    })

    it('should handle RECEIVE_PART', () => {
      expect(
        reduceServer(
          initialState,
          messageReceivers.PART('serverKey', someone, ['#channel', 'Goodbye!']),
          extraStates,
        ),
      ).toMatchSnapshot()
    })
  })

  describe('when it is me', () => {
    const me: User = { nick: 'me', user: 'user', host: 'host' }

    it('should handle RECEIVE_NICK', () => {
      expect(
        reduceServer(
          initialState,
          messageReceivers.NICK('serverKey', me, ['new_nick']),
          extraStates,
        ),
      ).toMatchSnapshot()
    })

    it('should handle RECEIVE_PART', () => {
      expect(
        reduceServer(
          initialState,
          messageReceivers.PART('serverKey', me, ['#channel', 'Goodbye!']),
          extraStates,
        ),
      ).toMatchSnapshot()
    })
  })

  it('should handle RECEIVE_PONG_FROM_SERVER', () => {
    expect(
      reduceServer(
        initialState,
        messageReceivers.PONG('serverKey', 'server', ['server', 'key']),
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should handle RECEIVE_RPL_MYINFO', () => {
    expect(
      reduceServer(
        initialState,
        messageReceivers['004']('serverKey', 'server', [
          '?',
          '?',
          '?',
          'available_user_modes',
          'available_channel_modes',
        ]),
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should not broadcast', () => {
    expect(
      reduceServer(
        initialState,
        {
          type: 'UNHANDLED_ACTION',
          route: { serverKey: 'serverKey', bufferKey: BufferKey.NONE },
        },
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should broadcast to active buffer', () => {
    expect(
      reduceServer(
        initialState,
        {
          type: 'UNHANDLED_ACTION',
          route: { serverKey: 'serverKey', bufferKey: BufferKey.ACTIVE },
        },
        extraStates,
      ),
    ).toMatchSnapshot()
  })

  it('should broadcast to all buffers', () => {
    expect(
      reduceServer(
        initialState,
        {
          type: 'UNHANDLED_ACTION',
          route: { serverKey: 'serverKey', bufferKey: BufferKey.ALL },
        },
        extraStates,
      ),
    ).toMatchSnapshot()
  })
})
