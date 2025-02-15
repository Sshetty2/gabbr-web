import { logChatPromiseExecution } from 'stream-chat';
import {
  MessageInput,
  MessageInputProps,
  MessageList,
  Thread,
  useChannelActionContext,
  Window
} from 'stream-chat-react';
import { encodeToMp3 } from 'stream-chat-react/mp3-encoder';

import { MessagingChannelHeader } from '../../components';
import { useGiphyContext } from '../../context';
import { StreamChatGenerics } from '../../types';

export type ChannelInnerProps = {
  toggleMobile: () => void;
  theme: string;
};

const ChannelInner = (props: ChannelInnerProps) => {
  const { theme, toggleMobile } = props;
  const { giphyState, setGiphyState } = useGiphyContext();

  const { sendMessage } = useChannelActionContext<StreamChatGenerics>();

  const overrideSubmitHandler: MessageInputProps<StreamChatGenerics>['overrideSubmitHandler'] = (
    message,
    _,
    ...restSendParams
  ) => {
    let updatedMessage;

    if (message.attachments?.length && message.text?.startsWith('/giphy')) {
      const updatedText = message.text.replace('/giphy', '');
      updatedMessage = {
        ...message,
        text: updatedText
      };
    }

    if (giphyState) {
      const updatedText = `/giphy ${message.text}`;
      updatedMessage = {
        ...message,
        text: updatedText
      };
    }

    if (sendMessage) {
      const newMessage = updatedMessage || message;
      const parentMessage = newMessage.parent;

      const messageToSend = {
        ...newMessage,
        parent: parentMessage
      };

      const sendMessagePromise = sendMessage(messageToSend, ...restSendParams);
      logChatPromiseExecution(sendMessagePromise, 'send message');
    }

    setGiphyState(false);
  };

  const actions = ['delete', 'edit', 'flag', 'markUnread', 'mute', 'react', 'reply'];

  return (
    <>
      <Window>
        <MessagingChannelHeader
          theme={theme}
          toggleMobile={toggleMobile} />
        <MessageList messageActions={actions} />
        <MessageInput
          focus
          overrideSubmitHandler={overrideSubmitHandler}
          audioRecordingConfig={{ transcoderConfig: { encoder: encodeToMp3 } }}
          audioRecordingEnabled
          asyncMessagesMultiSendEnabled
        />
      </Window>
      <Thread />
    </>
  );
};

export default ChannelInner;
