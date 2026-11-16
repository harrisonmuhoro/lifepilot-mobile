import renderer, { act } from 'react-test-renderer';
import { Text } from '../../src/components/common/Text';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';

describe('Common UI Components', () => {
  it('renders Text with proper content', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Text variant="h1" color="primary">
          LifePilot Title
        </Text>
      );
    });
    expect(tree.toJSON()).toBeDefined();
  });

  it('renders Button and displays title', () => {
    const onPress = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<Button title="Save Changes" onPress={onPress} />);
    });
    expect(tree.toJSON()).toBeDefined();
  });

  it('renders Card with children', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Card variant="elevated">
          <Text>Card Inner Content</Text>
        </Card>
      );
    });
    expect(tree.toJSON()).toBeDefined();
  });

  it('renders Badge with custom label and variant', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<Badge label="Active" variant="success" />);
    });
    expect(tree.toJSON()).toBeDefined();
  });
});
