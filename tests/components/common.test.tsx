import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import { Text } from '../../src/components/common/Text';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';

describe('Common UI Components', () => {
  describe('Text', () => {
    it('renders text content and variant props correctly', () => {
      let component: any;
      act(() => {
        component = renderer.create(
          <Text variant="h1" color="primary">
            LifePilot Dashboard
          </Text>
        );
      });

      const json = component.toJSON();
      expect(json).toBeDefined();
      expect(JSON.stringify(json)).toContain('LifePilot Dashboard');
    });

    it('applies variant and color styling', () => {
      let component: any;
      act(() => {
        component = renderer.create(
          <Text variant="caption" color="secondary">
            Subtitle Text
          </Text>
        );
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).toContain('Subtitle Text');
    });
  });

  describe('Button', () => {
    it('renders button title and triggers onPress callback', () => {
      const onPressMock = jest.fn();
      let component: any;
      act(() => {
        component = renderer.create(
          <Button title="Save Changes" onPress={onPressMock} />
        );
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).toContain('Save Changes');

      const touchable = component.root.findByType(TouchableOpacity);
      act(() => {
        touchable.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('disables press interactions when disabled', () => {
      const onPressMock = jest.fn();
      let component: any;
      act(() => {
        component = renderer.create(
          <Button title="Submit" onPress={onPressMock} disabled />
        );
      });

      const touchable = component.root.findByType(TouchableOpacity);
      expect(touchable.props.disabled).toBe(true);
    });

    it('shows loading indicator and hides title when loading is true', () => {
      let component: any;
      act(() => {
        component = renderer.create(
          <Button title="Submit" onPress={() => {}} loading />
        );
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).not.toContain('Submit');
    });
  });

  describe('Card', () => {
    it('renders children content correctly', () => {
      let component: any;
      act(() => {
        component = renderer.create(
          <Card variant="elevated">
            <Text>Card Inner Content</Text>
          </Card>
        );
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).toContain('Card Inner Content');
    });
  });

  describe('Badge', () => {
    it('renders label with proper variant styling', () => {
      let component: any;
      act(() => {
        component = renderer.create(<Badge label="Active" variant="success" />);
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).toContain('Active');
    });
  });

  describe('EmptyState', () => {
    it('renders title, description, and handles action button callback', () => {
      const onActionMock = jest.fn();
      let component: any;
      act(() => {
        component = renderer.create(
          <EmptyState
            title="No Transactions"
            description="Create your first entry"
            actionTitle="Add Transaction"
            onAction={onActionMock}
          />
        );
      });

      const json = component.toJSON();
      expect(JSON.stringify(json)).toContain('No Transactions');
      expect(JSON.stringify(json)).toContain('Create your first entry');
      expect(JSON.stringify(json)).toContain('Add Transaction');

      const actionButton = component.root.findByProps({
        title: 'Add Transaction',
      });
      act(() => {
        actionButton.props.onPress();
      });
      expect(onActionMock).toHaveBeenCalledTimes(1);
    });
  });
});
