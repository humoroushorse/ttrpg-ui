import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Editor = DndCharacterModels.Characters.CharacterEditor;
type Member = DndCampaignModels.Campaigns.CampaignMember;
type Lifetime = NonNullable<DndCharacterModels.Characters.CharacterTransferOffer['expires_in']>;

const LIFETIMES: { value: Lifetime; label: string }[] = [
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
];

/** DM or Player (the campaign's owner is a DM; "Owner" here would read as the character's) */
const roleLabel = (m: Member): string => (m.role === 'dm' ? 'DM' : 'Player');

/**
 * Who else can edit the character, and handing it over. The owner adds editors by username (its
 * campaign's members are suggested, with their role) and takes them off; offers the character to
 * someone, who becomes its owner on accepting; and cancels a pending offer. An editor can take
 * themselves off (`left`: the page goes back to the list).
 */
@Component({
  selector: 'lib-dnd-character-sharing',
  imports: [
    DatePipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './character-sharing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCharacterSharingComponent {
  private readonly api = inject(DndCharacterApiService);

  private readonly campaignApi = inject(DndCampaignApiService);

  readonly character = input.required<Character>();

  readonly left = output<void>();

  protected readonly lifetimes = LIFETIMES;

  protected readonly roleLabel = roleLabel;

  protected readonly owner = computed(() => !!this.character().viewer?.can_manage);

  protected readonly editors = rxResource({
    params: () => {
      const c = this.character();
      return c.viewer?.can_manage || c.viewer?.editor ? c.id : undefined;
    },
    stream: ({ params }) => this.api.getEditors(params),
  });

  protected readonly editorList = computed(() => (this.editors.hasValue() ? this.editors.value().entities : []));

  /** Its campaign's members, to suggest (the owner's view) */
  protected readonly members = rxResource({
    params: () => (this.owner() ? (this.character().campaign_id ?? undefined) : undefined),
    stream: ({ params }) => this.campaignApi.getMembers(params),
  });

  private readonly memberById = computed(
    () => new Map((this.members.hasValue() ? this.members.value().entities : []).map((m) => [m.user_id, m])),
  );

  protected readonly transfer = rxResource({
    params: () => (this.owner() ? this.character().id : undefined),
    stream: ({ params }) => this.api.getTransfer(params),
  });

  protected readonly pending = computed(() => (this.transfer.hasValue() ? this.transfer.value().transfer : null));

  protected readonly editorName = signal('');

  protected readonly transferName = signal('');

  protected readonly expiresIn = signal<Lifetime>('7d');

  protected readonly editorSuggestions = computed(() =>
    this.suggest(this.editorName(), new Set(this.editorList().map((e) => e.user_id))),
  );

  protected readonly transferSuggestions = computed(() => this.suggest(this.transferName(), new Set()));

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  /** The editor's campaign role tag, when they're in the character's campaign */
  protected memberOf(userId: string): Member | undefined {
    return this.memberById().get(userId);
  }

  onAddEditor(): void {
    const username = this.editorName().trim();
    if (!username) return;
    this.run(this.api.addEditor(this.character().id, { username }), (list) => {
      this.editors.set(list);
      this.editorName.set('');
    });
  }

  onRemoveEditor(e: Editor): void {
    this.run(this.api.removeEditor(this.character().id, e.user_id), (list) => this.editors.set(list));
  }

  onStopEditing(): void {
    const me = this.editorList().find((e) => e.me);
    if (!me || !confirm(`Stop editing ${this.character().name}? Its owner can add you again.`)) return;
    this.run(this.api.removeEditor(this.character().id, me.user_id), () => this.left.emit());
  }

  onOffer(): void {
    const username = this.transferName().trim();
    if (!username) return;
    const text = `Offer ${this.character().name} to ${username}? It becomes theirs when they accept.`;
    if (!confirm(text)) return;
    this.run(this.api.offerTransfer(this.character().id, { username, expires_in: this.expiresIn() }), (t) => {
      this.transfer.set(t);
      this.transferName.set('');
    });
  }

  onCancelOffer(): void {
    this.run(this.api.cancelTransfer(this.character().id), (t) => this.transfer.set(t));
  }

  /** Campaign members matching what's typed, not the caller and not `taken` */
  private suggest(term: string, taken: Set<string>): Member[] {
    const t = term.trim().toLowerCase();
    return [...this.memberById().values()].filter(
      (m) => !m.me && !taken.has(m.user_id) && !!m.username && m.username.toLowerCase().includes(t),
    );
  }

  private run<T>(write: Observable<T>, done: (value: T) => void): void {
    this.saving.set(true);
    this.error.set(null);
    write.subscribe({
      next: (value) => {
        this.saving.set(false);
        done(value);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
      },
    });
  }
}
